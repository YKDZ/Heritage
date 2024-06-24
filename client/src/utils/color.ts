export function getContentColorForBackground(hexColor: string | undefined): "#FFFFFF" | "#000000" {
    if (!hexColor) {
        return "#000000"
    }
    
    hexColor = hexColor.replace(/^#/, '');

    const r = parseInt(hexColor.slice(0, 2), 16);
    const g = parseInt(hexColor.slice(2, 4), 16);
    const b = parseInt(hexColor.slice(4, 6), 16);

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return luminance < 150 ? "#FFFFFF" : "#000000";
}
