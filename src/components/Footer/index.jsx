import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles.scss';
import usePolicyStore from '@/stores/usePolicyStore';

const Footer = () => {
  const { fetchPolicies } = usePolicyStore();
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const data = await fetchPolicies();
        setPolicies(data || []);
      } catch (err) {
        console.error('Error loading policies:', err);
      }
    };

    loadPolicies();
  }, [fetchPolicies]);

  return (
    <footer className="footer">
      <div className="container mx-auto px-4">
        <div className="footer-grid">
          {/* Column 1 - Left Side */}
          <div className="footer-column">
            {/* About */}
            <div className="footer-section">
              <h3 className="footer-title">GreenSpace</h3>
              <p className="footer-text">
                Chúng tôi cung cấp các giải pháp thiết kế và sản phẩm xanh cho không gian sống của bạn.
              </p>
            </div>

            {/* Contact */}
            <div className="footer-section">
              <h3 className="footer-title">Liên hệ</h3>
              <ul className="footer-contact">
                <li>Địa chỉ: 123 Đường Xanh, Quận 1, TP.HCM</li>
                <li>Email: info@greenspace.com</li>
                <li>Điện thoại: (028) 1234 5678</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="footer-title">Liên kết nhanh</h3>
              <ul className="footer-links">
                <li><Link to="/home" className="footer-link">Trang chủ</Link></li>
                <li><Link to="/designs" className="footer-link">Thiết kế</Link></li>
                <li><Link to="/products" className="footer-link">Sản phẩm</Link></li>
                <li><Link to="/about" className="footer-link">Giới thiệu</Link></li>
                <li><Link to="/support" className="footer-link">Hỗ trợ</Link></li>
                <li><Link to="/blog" className="footer-link">Blog</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 2 - Right Side */}
          <div className="footer-column">
            {/* Map Section */}
            <div className="footer-section">
              <h3 className="footer-title">Vị trí cửa hàng</h3>
              <div className="footer-map-container" style={{height: "230px"}}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197667!2d106.69173407486698!3d10.780260089362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9d8d1bb3%3A0xd7ab182b35e0765d!2sNguy%E1%BB%85n%20Hu%E1%BB%87%20Walking%20Street!5e0!3m2!1sen!2s!4v1716204301121!5m2!1sen!2s"
                  width="100%"
                  height="230"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="GreenSpace Location"
                  className="footer-map"
                ></iframe>
              </div>
            </div>

            <div className="footer-section">
              <h3 className="footer-title">Chính sách</h3>
              <ul className="footer-links">
                {policies.length > 0 ? (
                  policies.map((policy) => (
                    <li key={policy.id}>
                      <Link to={`/policy/${policy.id}`} className="footer-link">
                        {policy.documentName}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link to="/policy" className="footer-link">Xem tất cả chính sách</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>© 2025 GreenSpace. Tất cả quyền được bảo lưu.</p>
          </div>
          <div className="footer-social">
            <a href="#" className="social-link">
              <span className="sr-only">Facebook</span>
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="social-link">
              <span className="sr-only">Instagram</span>
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="social-link">
              <span className="sr-only">TikTok</span>
              <svg
                className="social-icon"
                fill="currentColor"
                viewBox="0 0 512 512"
                aria-hidden="true"
              >
                <path d="M412.19,118.66a109.27,109.27,0,0,1-9.45-5.5,132.87,132.87,0,0,1-24.27-20.62c-18.1-20.71-24.86-41.72-27.35-56.43h.1C349.14,23.9,350,16,350.13,16H267.69V334.78c0,4.28,0,8.51-.18,12.69,0,.52-.05,1-.08,1.56,0,.23,0,.47-.05.71,0,.06,0,.12,0,.18a70,70,0,0,1-35.22,55.56,68.8,68.8,0,0,1-34.11,9c-38.41,0-69.54-31.32-69.54-70s31.13-70,69.54-70a68.9,68.9,0,0,1,21.41,3.39l.1-83.94a153.14,153.14,0,0,0-118,34.52,161.79,161.79,0,0,0-35.3,43.53c-3.48,6-16.61,30.11-18.2,69.24-1,22.21,5.67,45.22,8.85,54.73v.2c2,5.6,9.75,24.71,22.38,40.82A167.53,167.53,0,0,0,115,470.66v-.2l.2.2C155.11,497.78,199.36,496,199.36,496c7.66-.31,33.32,0,62.46-13.81,32.32-15.31,50.72-38.12,50.72-38.12a158.46,158.46,0,0,0,27.64-45.93c7.46-19.61,9.95-43.13,9.95-52.53V176.49c1,.6,14.32,9.41,14.32,9.41s19.19,12.3,49.13,20.31c21.48,5.7,50.42,6.9,50.42,6.9V131.27C453.86,132.37,433.27,129.17,412.19,118.66Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 