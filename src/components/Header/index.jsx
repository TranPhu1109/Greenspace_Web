import { useState, useEffect } from "react";
import TopHeader from "./components/TopHeader";
import MainHeader from "./components/MainHeader";
import NavigationMenu from "./components/NavigationMenu";
import MobileMenu from "./components/MobileMenu";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import signalRService from "@/services/signalRService";
import "./styles.scss";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { user } = useAuthStore();
  const { cartItems, fetchCartItems } = useCartStore();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

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

  useEffect(() => {
    if (!user) return;

    const connectSignalR = async () => {
      try {
        await signalRService.startConnection();

        signalRService.on("messagereceived", (messageType, messageData) => {
          console.log(`Customer Header SignalR received - Type: ${messageType}, Data: ${messageData}`);

          const newNotification = {
            id: Date.now(),
            title: messageType === 'UpdateOrderService' ? "Cập nhật đơn hàng" : "Thông báo",
            message: `Cập nhật cho ID: ${messageData}`,
            relatedId: messageData,
            timestamp: new Date().toLocaleTimeString(),
            read: false,
          };
          setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
          setNotificationCount((prev) => prev + 1);
        });

      } catch (err) {
        console.error("Customer Header SignalR connection failed: ", err);
      }
    };

    connectSignalR();

    return () => {
      signalRService.off("messagereceived");
      signalRService.stopConnection();
    };
  }, [user]);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleNotificationClick = (notification) => {
    console.log("Customer Notification clicked:", notification);
  };

  const handleViewAllClick = () => {
    console.log("Customer View all notifications clicked");
    setNotificationCount(0);
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <TopHeader 
        user={user} 
        scrolled={scrolled} 
        cartItems={cartItems} 
        notificationCount={notificationCount}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onViewAllClick={handleViewAllClick}
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
