import { backdropOptions, floorOptions, furnitureCatalog, maxFurniture, parkMediaLimit, parkMediaTypes, tintOptions } from "./park-layout.js";

const titleOf = (item) => item.kind === "door" ? "串门门牌" : furnitureCatalog[item.kind];
function node(tag, text, className) {
  const result = document.createElement(tag);
  if (text) result.textContent = text;
  if (className) result.className = className;
  return result;
}
function button(text, action, className = "quiet") {
  const result = node("button", text, className);
  result.type = "button";
  result.onclick = action;
  return result;
}
function place(element, item) {
  element.style.left = `${item.x * 100}%`;
  element.style.setProperty("--furniture-scale", item.scale);
  element.dataset.tint = item.tint;
}

export function renderParkFurniture(layer, design, draft, openRooms) {
  layer.parentElement.dataset.floor = design.floor;
  layer.classList.toggle("editing", Boolean(draft));
  layer.replaceChildren();
  for (const item of design.items) {
    const door = item.kind === "door";
    const interactive = Boolean(draft) || door;
    const piece = node(interactive ? "button" : "div", null, `furniture-piece ${item.kind}`);
    piece.dataset.item = item.id;
    if (interactive) {
      piece.type = "button";
      piece.title = draft ? titleOf(item) : "切换房间";
      piece.setAttribute("aria-label", piece.title);
    } else piece.setAttribute("aria-hidden", "true");
    const details = ["sofa", "desk"].includes(item.kind) ? 2 : ["side-table", "door", "bookcase", "mailbox"].includes(item.kind) ? 1 : 0;
    for (let index = 0; index < details; index++) piece.append(node("i"));
    place(piece, item);
    if (draft) {
      piece.classList.toggle("selected", item.id === draft.selected);
      piece.onclick = () => draft.select(item.id);
      let grab;
      piece.onpointerdown = event => {
        if (event.button !== 0) return;
        grab = { pointer: event.pointerId, start: event.clientX, x: item.x };
        piece.setPointerCapture(event.pointerId);
        draft.select(item.id);
      };
      piece.onpointermove = event => {
        if (grab?.pointer !== event.pointerId) return;
        item.x = Math.min(0.965, Math.max(0.035, grab.x + (event.clientX - grab.start) / layer.clientWidth));
        place(piece, item);
        draft.updatePosition(item.x);
      };
      piece.onlostpointercapture = () => { grab = null; };
    } else if (door) piece.onclick = openRooms;
    layer.append(piece);
  }
}

function options(values, current, onChange) {
  const select = node("select");
  for (const [value, label] of Object.entries(values)) select.append(new Option(label, value));
  select.value = current;
  select.onchange = () => onChange(select.value);
  return select;
}
function field(label, control) {
  const wrapper = node("label", null, "park-field");
  wrapper.append(node("span", label), control);
  return wrapper;
}

export function mountParkEditor(root, draft, actions) {
  const design = draft.design;
  root.append(node("p", "从家具库添加物件，拖动场景里的家具来摆放。保存后同房好友也会看到。", "muted"));
  const controls = node("div", null, "park-fields");
  const showPreset = () => {
    draft.file = null;
    design.media = null;
    actions.preview();
    uploadLabel.textContent = "未使用自定义背景";
  };
  controls.append(
    field("地板", options(floorOptions, design.floor, floor => { design.floor = floor; actions.preview(); })),
    field("自带背景", options(backdropOptions, design.backdrop, backdrop => {
      design.backdrop = backdrop;
      showPreset();
    })),
  );
  root.append(controls);
  const upload = node("input");
  upload.type = "file";
  upload.accept = Object.keys(parkMediaTypes).join(",");
  upload.hidden = true;
  const uploadLabel = node("span", draft.file?.name || (design.media ? "已设置自定义背景" : "未使用自定义背景"), "muted");
  upload.onchange = () => {
    const file = upload.files[0];
    upload.value = "";
    if (!file) return;
    if (!Object.hasOwn(parkMediaTypes, file.type) || file.size > parkMediaLimit || file.size < 8) {
      actions.notify("请选择 25 MB 以内的 PNG、JPEG、GIF、WebP、MP4 或 WebM。");
      return;
    }
    draft.file = file;
    uploadLabel.textContent = file.name;
    actions.preview();
  };
  const media = node("div", null, "park-upload actions");
  media.append(upload, button("上传背景", () => upload.click()), button("恢复自带背景", showPreset), uploadLabel);
  root.append(media, node("p", "支持静图、动图与视频，最大 25 MB。视频静音循环。", "muted"));
  const addRow = node("div", null, "inline-form");
  const catalog = options(furnitureCatalog, "plant", () => {});
  catalog.setAttribute("aria-label", "选择要添加的家具");
  addRow.append(catalog, button("添加家具", () => {
    if (design.items.length >= maxFurniture) { actions.notify("这个乐园已经摆满了家具。"); return; }
    const id = Math.random().toString(36).slice(2, 12);
    design.items.push({ id, kind: catalog.value, x: 0.5, scale: 1, tint: "original" });
    draft.selected = id;
    redrawSelection();
    actions.preview();
  }));
  const selection = node("div", null, "park-selection");
  root.append(node("h3", "家具摆放"), addRow, selection);
  let position;
  draft.updatePosition = (x) => { if (position) position.value = Math.round(x * 1000); };
  draft.select = (id) => {
    if (draft.selected === id) return;
    draft.selected = id;
    redrawSelection();
    document.querySelectorAll(".furniture-piece").forEach(piece => piece.classList.toggle("selected", piece.dataset.item === id));
  };
  function redrawSelection() {
    selection.replaceChildren();
    const item = design.items.find(entry => entry.id === draft.selected) || design.items[0];
    if (!item) return;
    draft.selected = item.id;
    selection.append(field("正在编辑", options(
      Object.fromEntries(design.items.map(entry => [entry.id, `${titleOf(entry)} · ${Math.round(entry.x * 100)}%`])),
      item.id, id => draft.select(id))));
    position = node("input");
    Object.assign(position, { type: "range", min: 35, max: 965, value: Math.round(item.x * 1000) });
    position.oninput = () => { item.x = Number(position.value) / 1000; actions.place(item); };
    const scale = node("input");
    Object.assign(scale, { type: "range", min: 55, max: 140, value: Math.round(item.scale * 100) });
    scale.oninput = () => { item.scale = Number(scale.value) / 100; actions.place(item); };
    const fields = node("div", null, "park-fields");
    fields.append(field("左右位置", position), field("大小", scale),
      field("配色", options(tintOptions, item.tint, tint => { item.tint = tint; actions.place(item); })));
    selection.append(fields);
    if (item.kind !== "door") selection.append(button("移除此家具", () => {
      design.items = design.items.filter(entry => entry.id !== item.id);
      draft.selected = design.items[0]?.id;
      redrawSelection();
      actions.preview();
    }));
  }
  redrawSelection();
  const submit = button("保存布置", () => actions.save(submit), "primary");
  submit.disabled = draft.saving;
  root.append(submit);
}

export function placeFurniture(layer, item) {
  const piece = [...layer.children].find(child => child.dataset.item === item.id);
  if (piece) place(piece, item);
}
