import FSentinelResource from "./FSentinelResource.ts";

export type FSentinelOptions = {
    isActivated: boolean;
    showFootprint: boolean;
    showResourceHints: boolean;
    maxBytesPer100x100Threshold: number;
    maxBytesPerResourceThreshold: number;
    ignoreResourcesBelowBytesThreshold: number;
    guardZIndex: number;
    resourceFilter: (url: string) => boolean;
    onInitialFootprint?: (footprint: FootprintGuardResult) => void;
    onFootprintChange?: (footprint: FootprintGuardChangeResult) => void;
}

export type FootprintGuardResult = {
    total: {bytes: number, bytesFormatted: string, rating: string}
    lastDelta: {bytes: number, bytesFormatted: string}
}

export type FootprintGuardChangeResult = {
    total: {bytes: number, bytesFormatted: string, rating: string}
    lastDelta: {bytes: number, bytesFormatted: string}
}

export type FSentinelRating = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export type FSentinelResourcesOptions = {
    fgOptions: FSentinelOptions
    onResourceUpdated: (resource: FSentinelResource) => void
    onInitialFootprint: () => void
}