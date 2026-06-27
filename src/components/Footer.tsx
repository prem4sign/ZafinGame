import footerImage from "../assets/ui/zafinRISE_footer.png";

type FooterProps = {
  className?: string;
};

export default function Footer({ className = "w-full" }: FooterProps) {
  return (
    <footer className={`shrink-0 ${className}`} aria-label="Zafin RISE 2026 event footer">
      <img
        src={footerImage}
        alt="zafinRISE 2026. August 16th - Technopark Phase 3."
        className="block h-auto w-full select-none"
        draggable={false}
        decoding="sync"
        loading="eager"
      />
    </footer>
  );
}
