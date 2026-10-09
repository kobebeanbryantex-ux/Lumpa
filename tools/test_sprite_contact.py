"""Regression coverage for floating paws caused by atlas-edge fragments."""

from pathlib import Path
import unittest

from PIL import Image, ImageDraw

from sprite_contact import main_component_bounds


class SpriteContactTests(unittest.TestCase):
    def test_ignores_disconnected_fragments_below_the_character(self):
        image = Image.new("RGBA", (64, 64))
        ImageDraw.Draw(image).rectangle((10, 8, 45, 40), fill=(50, 40, 30, 255))
        ImageDraw.Draw(image).rectangle((25, 60, 30, 63), fill=(50, 40, 30, 255))
        self.assertEqual(image.getchannel("A").getbbox()[3], 64)
        self.assertEqual(main_component_bounds(image), (10, 8, 46, 41))

    def test_all_grounded_frenchie_frames_end_at_the_same_contact_line(self):
        root = Path(__file__).resolve().parents[1] / "public/assets"
        frames = list((root / "pixel_companions_v6/frames").glob("*.png"))
        frames += list((root / "pixel_companions_v7/frames").glob("*.png"))
        frames += list((root / "pixel_companions_v8/frames").glob("*.png"))
        self.assertEqual(len(frames), 48)
        for path in frames:
            with self.subTest(frame=path.name), Image.open(path) as image:
                self.assertEqual(main_component_bounds(image)[3], 232)


if __name__ == "__main__":
    unittest.main()
