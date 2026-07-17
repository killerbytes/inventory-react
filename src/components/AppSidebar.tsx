import {
  Annoyed,
  BadgeDollarSign,
  BadgePercent,
  Banknote,
  BanknoteArrowUp,
  Barcode,
  BookUser,
  Boxes,
  ChartCandlestick,
  ClipboardList,
  Container,
  CreditCard,
  Diff,
  Gauge,
  Home,
  Search,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { ROUTE_PERMISSIONS } from "@/utils/permissions";
import { formatDateTime } from "@/utils/formatters";
import { Link, useLocation } from "react-router";
import { ROUTES } from "@/utils/definitions";
import UserDropdown from "./UserDropdown";
import { useStore } from "@/stores";
import Http from "@/services/http";
import Header from "./Header";
import React from "react";

const items = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: Home,
    roles: ROUTE_PERMISSIONS[ROUTES.DASHBOARD],
  },
  {
    title: "Good Receipt",
    url: ROUTES.GOOD_RECEIPT,
    icon: Truck,
    roles: ROUTE_PERMISSIONS[ROUTES.GOOD_RECEIPT],
  },
  {
    title: "Sales Orders",
    url: ROUTES.SALES_ORDERS,
    icon: BanknoteArrowUp,
    roles: ROUTE_PERMISSIONS[ROUTES.SALES_ORDERS],
  },
  {
    title: "Invoices",
    url: ROUTES.INVOICES,
    icon: CreditCard,
    roles: ROUTE_PERMISSIONS[ROUTES.INVOICES],
  },
  {
    title: "Search",
    url: ROUTES.SEARCH,
    icon: Search,
  },
  {
    title: "Barcode Scanner",
    url: ROUTES.SCANNER,
    icon: Barcode,
  },
];

const reports = [
  {
    title: "Payments",
    url: ROUTES.PAYMENTS,
    icon: Banknote,
    roles: ROUTE_PERMISSIONS[ROUTES.PAYMENTS],
  },
  {
    title: "Inventory Movements",
    url: ROUTES.INVENTORY_MOVEMENTS,
    icon: ClipboardList,
    roles: ROUTE_PERMISSIONS[ROUTES.INVENTORY_MOVEMENTS],
  },
  {
    title: "Stock Adjustments",
    url: ROUTES.STOCK_ADJUSTMENTS,
    icon: Diff,
    roles: ROUTE_PERMISSIONS[ROUTES.STOCK_ADJUSTMENTS],
  },
  {
    title: "Price History",
    url: ROUTES.PRICE_HISTORY,
    icon: ChartCandlestick,
    roles: ROUTE_PERMISSIONS[ROUTES.PRICE_HISTORY],
  },
  {
    title: "Reorder Levels",
    url: ROUTES.REORDERS,
    icon: Gauge,
    roles: ROUTE_PERMISSIONS[ROUTES.REORDERS],
  },
  {
    title: "Popular",
    url: ROUTES.REPORTS_POPULAR,
    icon: TrendingUp,
    roles: ROUTE_PERMISSIONS[ROUTES.REPORTS_POPULAR],
  },
  {
    title: "Profit",
    url: ROUTES.REPORTS_PROFIT,
    icon: BadgeDollarSign,
    roles: ROUTE_PERMISSIONS[ROUTES.REPORTS_PROFIT],
  },
  {
    title: "No Sales",
    url: ROUTES.REPORTS_NO_SALES,
    icon: Annoyed,
    roles: ROUTE_PERMISSIONS[ROUTES.REPORTS_NO_SALES],
  },
];

const menu = [
  {
    title: "Products",
    url: ROUTES.PRODUCTS,
    icon: ShoppingCart,
    roles: ROUTE_PERMISSIONS[ROUTES.PRODUCTS],
  },
  {
    title: "Users",
    url: ROUTES.USERS,
    icon: Users,
    roles: ROUTE_PERMISSIONS[ROUTES.USERS],
  },
  {
    title: "Price Upload",
    url: ROUTES.PRICE_MANAGER,
    icon: BadgePercent,
    roles: ROUTE_PERMISSIONS[ROUTES.PRICE_MANAGER],
  },

  {
    title: "Categories",
    url: ROUTES.CATEGORIES,
    icon: Boxes,
    roles: ROUTE_PERMISSIONS[ROUTES.CATEGORIES],
  },
  {
    title: "Customers",
    url: ROUTES.CUSTOMERS,
    icon: BookUser,
    roles: ROUTE_PERMISSIONS[ROUTES.CUSTOMERS],
  },
  {
    title: "Suppliers",
    url: ROUTES.SUPPLIERS,
    icon: Container,
    roles: ROUTE_PERMISSIONS[ROUTES.SUPPLIERS],
  },
];

export default function AppSidebar() {
  const [build, setBuild] = React.useState<{
    env: string;
    buildTime: string;
  }>();
  const { authState } = useStore();
  const { setOpen, setOpenMobile } = useSidebar();
  const location = useLocation();
  const pathRef = React.useRef(location.pathname);

  React.useEffect(() => {
    if (location.pathname !== pathRef.current) {
      setOpenMobile(false);
    }
    pathRef.current = location.pathname;
  }, [location.pathname, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const getData = async () => {
      const http = new Http();
      const res = await http.get("/");
      setBuild(res);
    };
    getData();
  }, []);

  const Menus = ({
    items,
  }: {
    items: {
      title: string;
      url: string;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={item.url === location.pathname}>
          <Link to={item.url}>
            <item.icon className="text-gray-400" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <Header />
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-widest">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Menus
                items={items.filter(
                  (item: any) =>
                    !item.roles || item.roles.includes(authState.user.role),
                )}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-widest">
            Reports
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Menus
                items={reports.filter(
                  (item: any) =>
                    !item.roles || item.roles.includes(authState.user.role),
                )}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-widest">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Menus
                items={menu.filter(
                  (item: any) =>
                    !item.roles || item.roles.includes(authState.user.role),
                )}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserDropdown />
        <div className="text-center mt-auto py-2 border-t gap-2 flex flex-col text-xs">
          <div className="">&copy; {new Date().getFullYear()} My Hardware</div>
          <div className="uppercase flex gap-2 justify-center">
            {build?.env}
            <div>{formatDateTime(String(build?.buildTime ?? ""))}</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
