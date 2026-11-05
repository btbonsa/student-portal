// Local images (public/assets) for program cards/details, chosen by program name.
// Unmatched programs use DEFAULT_PROGRAM_IMAGE.
const PROGRAM_IMAGES: { match: RegExp; url: string }[] = [
  { match: /camera|photography|photo|video/i, url: "/assets/camera.jpg" },
  { match: /fashion|design|tailoring|sewing/i, url: "/assets/fashion.png" },
  { match: /mobile|maintenance|repair|phone/i, url: "/assets/mobile.jpg" },
];

const DEFAULT_PROGRAM_IMAGE = "/assets/fashion.png";

export function getProgramImageUrl(programName: string): string {
  return PROGRAM_IMAGES.find((p) => p.match.test(programName))?.url ?? DEFAULT_PROGRAM_IMAGE;
}
