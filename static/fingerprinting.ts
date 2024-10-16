/**
 * Device Fingerprinting Module
 *
 * This module collects various device and browser characteristics to generate a unique fingerprint.
 *
 * Note: Always ensure compliance with privacy laws and obtain user consent where required.
 */

import stringify from "json-stable-stringify";

export async function generateFingerprint(): Promise<string> {
  const components = await collectFingerprintComponents();
  console.trace(components);
  const data = stringify(components);
  return await hashString(data);
}

async function collectFingerprintComponents(): Promise<Record<string, unknown>> {
  const [
    userAgent,
    platform,
    screenResolution,
    colorDepth,
    deviceMemory,
    hardwareConcurrency,
    touchSupport,
    canvasFingerprint,
    webglFingerprint,
    browserFeatures,
  ] = await Promise.all([
    getUserAgent(),
    getPlatform(),
    getScreenResolution(),
    getColorDepth(),
    getDeviceMemory(),
    getHardwareConcurrency(),
    getTouchSupport(),
    getCanvasFingerprint(),
    getWebglFingerprint(),
    getBrowserFeatures(),
  ]);

  return {
    userAgent,
    platform,
    screenResolution,
    colorDepth,
    deviceMemory,
    hardwareConcurrency,
    touchSupport,
    canvasFingerprint,
    webglFingerprint,
    browserFeatures,
  };
}

// Utility function to hash a string using SHA-256
async function hashString(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Individual component functions

function getUserAgent(): string {
  return navigator.userAgent;
}

function getPlatform(): string {
  return navigator.platform;
}

function getScreenResolution(): { width: number; height: number } {
  return {
    width: window.screen.width,
    height: window.screen.height,
  };
}

function getColorDepth(): number {
  return window.screen.colorDepth;
}

function getDeviceMemory(): number | "unknown" {
  return (navigator as Navigator & { deviceMemory?: number }).deviceMemory || "unknown";
}

function getHardwareConcurrency(): number {
  return navigator.hardwareConcurrency;
}

function getTouchSupport(): { maxTouchPoints: number; touchEvent: boolean; touchStart: boolean } {
  return {
    maxTouchPoints: navigator.maxTouchPoints || 0,
    touchEvent: "ontouchstart" in window,
    touchStart: "ontouchstart" in document.documentElement,
  };
}

async function getCanvasFingerprint(): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  canvas.width = 200;
  canvas.height = 50;
  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.fillText("Sample Text", 2, 2);
  const dataUrl = canvas.toDataURL();
  return await hashString(dataUrl);
}

async function getWebglFingerprint(): Promise<{ vendor: string; renderer: string }> {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return { vendor: "unknown", renderer: "unknown" };
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (!debugInfo) return { vendor: "unknown", renderer: "unknown" };
  const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "unknown";
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "unknown";
  return { vendor, renderer };
}

function getBrowserFeatures(): Record<string, boolean> {
  return {
    serviceWorker: "serviceWorker" in navigator,
    localStorage: "localStorage" in window,
    sessionStorage: "sessionStorage" in window,
    indexedDB: "indexedDB" in window,
    geolocation: "geolocation" in navigator,
    webGL: (() => {
      try {
        const canvas = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && canvas.getContext("webgl"));
      } catch (e) {
        return false;
      }
    })(),
  };
}
