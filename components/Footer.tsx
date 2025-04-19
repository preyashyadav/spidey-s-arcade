"use client";

export default function Footer() {
  return (
    <footer className="comic-footer">
      <div className="inner stack">
        <p>© {new Date().getFullYear()} Spidey's Arcade 🎮</p>
        <p>
          Developed by <a href="https://preyashyadav.com" className="footer-link">Preyash Yadav</a> 🕸️
        </p>
      </div>
    </footer>
  );
}
