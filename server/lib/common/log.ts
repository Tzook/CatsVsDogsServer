export function logger(...info: any[]) {
    console.log("Info:", ...info);
}

export function errorer(...error: any[]) {
    console.error("Error:", ...error);
}