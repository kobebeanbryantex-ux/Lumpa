import { afterEach, expect, it, vi } from "vitest";
import { createNativePetDrag } from "./native-pet-drag.js";

afterEach(() => vi.useRealTimers());

it("keeps sampling across lost pointer capture and finishes on physical release", async () => {
  vi.useFakeTimers();
  const samples = [[20, 40, 30, 50, true], [80, 10, 90, 20, true], [80, 10, 90, 20, false]];
  const invoke = vi.fn(async () => samples.shift());
  const onMove = vi.fn();
  const onClick = vi.fn();
  const onError = vi.fn();
  const drag = createNativePetDrag({ invoke, onMove, onClick, onError });
  drag.start();
  await vi.runAllTimersAsync();
  expect(invoke).toHaveBeenNthCalledWith(2, "desktop_drag_sample", { anchor: [20, 40, 30, 50] });
  expect(onMove.mock.calls.map(([sample]) => sample.walking)).toEqual([true, false]);
  expect(onClick).not.toHaveBeenCalled();
  expect(onError).not.toHaveBeenCalled();
  // No DOM pointerup was required, and the next press is accepted.
  samples.push([80, 10, 90, 20, false]);
  drag.start();
  await vi.runAllTimersAsync();
  expect(onClick).toHaveBeenCalledTimes(1);
});

it("ignores late native replies after cancellation and allows a fresh drag", async () => {
  vi.useFakeTimers();
  let resolveSample;
  const invoke = vi.fn().mockImplementationOnce(() => new Promise(resolve => { resolveSample = resolve; }))
    .mockResolvedValue([10, 20, 15, 25, false]);
  const onClick = vi.fn(), onMove = vi.fn();
  const drag = createNativePetDrag({ invoke, onClick, onMove, onError: vi.fn() });
  drag.start();
  drag.cancel();
  drag.start();
  resolveSample([0, 0, 0, 0, true]);
  await vi.runAllTimersAsync();
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onMove).not.toHaveBeenCalled();
  expect(invoke).toHaveBeenCalledTimes(2);
});

it("recovers from an IPC failure without leaving the pet locked", async () => {
  vi.useFakeTimers();
  const invoke = vi.fn().mockRejectedValueOnce(new Error("window unavailable"))
    .mockResolvedValue([0, 0, 0, 0, false]);
  const onError = vi.fn(), onClick = vi.fn();
  const drag = createNativePetDrag({ invoke, onError, onClick, onMove: vi.fn() });
  drag.start();
  await vi.runAllTimersAsync();
  expect(onError).toHaveBeenCalledTimes(1);
  drag.start();
  await vi.runAllTimersAsync();
  expect(onClick).toHaveBeenCalledTimes(1);
});
