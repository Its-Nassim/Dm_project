export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <div className="brand-mark brand-mark--small">House Price Relevance</div>
          <p>Classification-only output built for transparent property review.</p>
        </div>
        <div className="footer-links">
          <a href="/prediction">Prediction</a>
          <a href="/model">Model</a>
          <a href="/about">About</a>
        </div>
      </div>
    </footer>
  )
}
