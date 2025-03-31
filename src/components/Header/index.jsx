import { useState, useEffect } from "react";
import TopHeader from "./components/TopHeader";
import MainHeader from "./components/MainHeader";
import NavigationMenu from "./components/NavigationMenu";
import MobileMenu from "./components/MobileMenu";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import "./styles.scss";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { user } = useAuthStore();
  const { cartItems, fetchCartItems } = useCartStore();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user, fetchCartItems]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const scrollingDown = currentScrollPos > prevScrollPos;

      if (Math.abs(currentScrollPos - prevScrollPos) > 10) {
        setScrolled(scrollingDown);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <TopHeader 
        user={user} 
        scrolled={scrolled} 
        cartItems={cartItems} 
      />
      <MainHeader />
      <NavigationMenu user={user} />
      <MobileMenu 
        open={open}
        showDrawer={showDrawer}
        onClose={onClose}
        user={user}
      />
    </header>
  );
};

export default Header;
