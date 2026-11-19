import { describe, expect, it } from "vitest";
import { collectLanUsers, normalizeLanAddress } from "./lan-peers.js";
import { broadcastAddresses, privateIPv4, publicLanUsers } from "../services/social/lan-discovery.mjs";

describe("LAN discovery and manual fallback", () => {
  it("adds the built-in port to a bare private IP without changing explicit ports or HTTPS", () => {
    expect(normalizeLanAddress("192.168.0.179")).toBe("http://192.168.0.179:4185");
    expect(normalizeLanAddress("http://192.168.0.179")).toBe("http://192.168.0.179:4185");
    expect(normalizeLanAddress("192.168.0.179:4199")).toBe("http://192.168.0.179:4199");
    expect(normalizeLanAddress("https://friends.example.com")).toBe("https://friends.example.com");
    expect(normalizeLanAddress("http://192.168.0.179:80")).toBe("http://192.168.0.179");
  });
  it("rejects public HTTP, credentials and non-network schemes", () => {
    for (const address of ["http://8.8.8.8", "http://user:password@192.168.1.2", "file:///tmp/pet", "javascript:alert(1)"]) {
      expect(() => normalizeLanAddress(address)).toThrow();
    }
  });
  it("hides this device and deduplicates aliases while preferring the active service", () => {
    const peer = { id: "peer-1234", device: "device-1234", name: "朋友", pet: "dog_french_fawn" };
    const own = { ...peer, id: "self-1234", device: "this-device" };
    const result = collectLanUsers([
      { url: "192.168.1.2:4185", users: [own, peer] },
      { url: "http://127.0.0.1:4185", users: [{ ...peer, id: "peer-5678" }] },
    ], "this-device", "http://127.0.0.1:4185", "self-1234");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("peer-5678");
  });
  it("ignores malformed and hostile discovery rows", () => {
    expect(collectLanUsers([{ url: "http://8.8.8.8", users: [{ id: "valid-id", name: "bad", pet: "cat_white" }] },
      { url: "192.168.1.2", users: [null, {}, { id: "valid-id", name: "bad", pet: "../../file" }] }], "self", "", "")).toEqual([]);
  });
  it("computes broadcasts for each private adapter without including loopback or public adapters", () => {
    expect(broadcastAddresses({ wifi: [{ family: "IPv4", internal: false, address: "192.168.0.20", netmask: "255.255.255.0" }],
      vpn: [{ family: "IPv4", internal: false, address: "10.1.0.20", netmask: "255.255.0.0" }],
      loop: [{ family: "IPv4", internal: true, address: "127.0.0.1", netmask: "255.0.0.0" }],
      public: [{ family: "IPv4", internal: false, address: "8.8.8.8", netmask: "255.255.255.0" }] })).toEqual(["192.168.0.255", "10.1.255.255"]);
    expect(privateIPv4("172.31.1.1")).toBe(true);
    expect(privateIPv4("172.32.1.1")).toBe(false);
  });
  it("advertises public profile fields only, never bearer tokens, file links or invitation keys", () => {
    const clients = new Map([["one", { id: "user-1234", session: "secret-token", room: "private-room" }]]);
    expect(publicLanUsers(clients, id => ({ id, name: "朋友", pet: "cat_white", device: "device-id", session: "secret-token", invite: "secret-link" })))
      .toEqual([{ id: "user-1234", name: "朋友", pet: "cat_white", device: "device-id" }]);
  });
});
