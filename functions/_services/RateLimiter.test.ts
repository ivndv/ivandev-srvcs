import { beforeEach, describe, expect, it } from "vitest";
import { RateLimiter } from "./RateLimiter";

describe("RateLimiter", () => {
	let limiter: RateLimiter;

	beforeEach(() => {
		limiter = new RateLimiter(3, 1000); // 3 requests por segundo
	});

	it("permite peticiones dentro del límite establecido", () => {
		const ip = "192.168.1.1";
		expect(limiter.isAllowed(ip)).toBe(true);
		expect(limiter.isAllowed(ip)).toBe(true);
		expect(limiter.isAllowed(ip)).toBe(true);
	});

	it("bloquea peticiones cuando se excede el límite máximo", () => {
		const ip = "192.168.1.2";
		expect(limiter.isAllowed(ip)).toBe(true);
		expect(limiter.isAllowed(ip)).toBe(true);
		expect(limiter.isAllowed(ip)).toBe(true);
		expect(limiter.isAllowed(ip)).toBe(false);
	});

	it("trata IPs distintas de forma independiente", () => {
		const ipA = "10.0.0.1";
		const ipB = "10.0.0.2";

		expect(limiter.isAllowed(ipA)).toBe(true);
		expect(limiter.isAllowed(ipA)).toBe(true);
		expect(limiter.isAllowed(ipA)).toBe(true);
		expect(limiter.isAllowed(ipA)).toBe(false);

		// ipB aún debe tener permitido
		expect(limiter.isAllowed(ipB)).toBe(true);
	});

	it("reinicia los contadores al llamar a reset()", () => {
		const ip = "192.168.1.3";
		limiter.isAllowed(ip);
		limiter.isAllowed(ip);
		limiter.isAllowed(ip);
		expect(limiter.isAllowed(ip)).toBe(false);

		limiter.reset();
		expect(limiter.isAllowed(ip)).toBe(true);
	});
});
