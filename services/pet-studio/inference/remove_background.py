from __future__ import annotations

import argparse
import os
from pathlib import Path

SERVICE_DIR = Path(__file__).resolve().parents[1]
HF_CACHE = SERVICE_DIR / ".cache" / "huggingface"
os.environ.setdefault("HF_HOME", str(HF_CACHE))
os.environ.setdefault("HF_MODULES_CACHE", str(HF_CACHE / "modules"))

import torch
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageSegmentation


MODEL_DIR = SERVICE_DIR / "models" / "birefnet"
IMAGE_SIZE = (1024, 1024)


def load_model(model_dir: Path):
    if not (model_dir / "model.safetensors").is_file():
        raise FileNotFoundError(
            f"BiRefNet weights were not found at {model_dir}. See models/README.md."
        )
    model = AutoModelForImageSegmentation.from_pretrained(
        str(model_dir),
        trust_remote_code=True,
        local_files_only=True,
    )
    model.to("cpu")
    model.eval()
    return model


def remove_background(model, source: Path, destination: Path):
    image = Image.open(source).convert("RGB")
    original_size = image.size
    preprocess = transforms.Compose(
        [
            transforms.Resize(IMAGE_SIZE),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ]
    )
    input_tensor = preprocess(image).unsqueeze(0)
    with torch.inference_mode():
        prediction = model(input_tensor)[-1].sigmoid().cpu()
    alpha = transforms.ToPILImage()(prediction[0].squeeze()).resize(
        original_size, Image.Resampling.BILINEAR
    )
    output = image.convert("RGBA")
    output.putalpha(alpha)
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination, format="PNG", optimize=True)
    return original_size


def main():
    parser = argparse.ArgumentParser(
        description="Create a transparent PNG cutout using the local BiRefNet model."
    )
    parser.add_argument("image", type=Path, help="Input JPG, PNG or WebP image")
    parser.add_argument("--output", type=Path, help="Output PNG path")
    parser.add_argument(
        "--threads",
        type=int,
        default=max(2, min(8, (os.cpu_count() or 4) // 2)),
        help="CPU threads (default: up to 8)",
    )
    parser.add_argument("--model-dir", type=Path, default=MODEL_DIR)
    args = parser.parse_args()
    if not args.image.is_file():
        parser.error(f"Input image does not exist: {args.image}")
    if args.threads < 1 or args.threads > 32:
        parser.error("--threads must be from 1 to 32")
    output = args.output or args.image.with_name(f"{args.image.stem}-transparent.png")

    torch.set_num_threads(args.threads)
    print("Loading local BiRefNet weights…", flush=True)
    model = load_model(args.model_dir)
    print(f"Extracting foreground from {args.image.name}…", flush=True)
    width, height = remove_background(model, args.image, output)
    print(f"Saved transparent PNG ({width}×{height}): {output.resolve()}")


if __name__ == "__main__":
    main()
