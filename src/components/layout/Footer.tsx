export default function Footer() {
  return (
    <footer className="bg-bg-nav mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Brand + Disclaimer */}
        <div className="text-center mb-6">
          <p className="text-[#6B5E4F] font-display text-lg">WookieFoot Lyrics</p>
          <p className="text-[#6B5E4F] text-sm mt-1">
            Fan-made with &#9829; &mdash; Not affiliated with WookieFoot
          </p>
        </div>

        {/* External Links */}
        <div className="flex justify-center space-x-6 mb-6">
          <a
            href="https://www.youtube.com/@wookiefootmark"
            className="text-[#6B5E4F] hover:text-accent-secondary transition-colors text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
          <a
            href="https://wookiefoot.bandcamp.com"
            className="text-[#6B5E4F] hover:text-accent-secondary transition-colors text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bandcamp
          </a>
          <a
            href="https://www.shangrilafest.com"
            className="text-[#6B5E4F] hover:text-accent-secondary transition-colors text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shangri-La Festival
          </a>
        </div>

        {/* Copyright */}
        <p className="text-center text-[#6B5E4F] text-xs">
          &copy; {new Date().getFullYear()} WookieFoot Lyrics. All lyrics are property of their respective owners.
        </p>
      </div>
    </footer>
  );
}
