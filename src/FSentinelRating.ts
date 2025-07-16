import type {FSentinelRating} from "./types.ts";

export function getRatingForBytes(bytes: number): FSentinelRating {
    // https://sustainablewebdesign.org/digital-carbon-ratings/
    const kb = bytes / 1024
    if (kb < 272.51) {
        return "A+"
    } else if (kb < 531.15) {
        return "A"
    } else if (kb < 975.85) {
        return "B"
    } else if (kb < 1410.39) {
        return "C"
    } else if (kb < 1875.01) {
        return "D"
    } else if (kb < 2419.56) {
        return "E"
    } else {
        return "F"
    }
}
