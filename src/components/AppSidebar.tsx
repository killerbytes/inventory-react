import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Home,
  ClipboardList,
  ChevronUp,
  Users,
  ShoppingCart,
  Boxes,
  BookUser,
  Container,
  BookType,
  PackageOpen,
  Diff,
  Banknote,
  CreditCard,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useGlobalStore, useUserStore } from "@/stores";
import { formatDateTime } from "@/utils/formatters";
import { Link, useLocation } from "react-router";
import { ROUTES } from "@/utils/definitions";
import Http from "@/services/http";
import Header from "./Header";
import UserIcon from "./User";
import React from "react";

const items = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    title: "Good Receipt",
    url: ROUTES.GOOD_RECEIPT,
    icon: BanknoteArrowDown,
  },
  {
    title: "Sales",
    url: ROUTES.SALES_ORDERS,
    icon: BanknoteArrowUp,
  },
  {
    title: "Invoices",
    url: ROUTES.INVOICES,
    icon: CreditCard,
  },
];

const reports = [
  {
    title: "Payments",
    url: ROUTES.PAYMENTS,
    icon: Banknote,
  },
  {
    title: "Inventory Movements",
    url: ROUTES.INVENTORY_MOVEMENTS,
    icon: ClipboardList,
  },
  {
    title: "Break Packs",
    url: ROUTES.BREAK_PACKS,
    icon: PackageOpen,
  },
  {
    title: "Stock Adjustments",
    url: ROUTES.STOCK_ADJUSTMENTS,
    icon: Diff,
  },
];

const menu = [
  {
    title: "Products",
    url: ROUTES.PRODUCTS,
    icon: ShoppingCart,
  },
  {
    title: "Users",
    url: ROUTES.USERS,
    icon: Users,
  },
  {
    title: "Categories",
    url: ROUTES.CATEGORIES,
    icon: Boxes,
  },
  {
    title: "Customers",
    url: ROUTES.CUSTOMERS,
    icon: BookUser,
  },
  {
    title: "Suppliers",
    url: ROUTES.SUPPLIERS,
    icon: Container,
  },
];

export default function AppSidebar() {
  const [build, setBuild] = React.useState<{
    env: string;
    buildTime: string;
  }>();
  const { logout } = useUserStore();
  const { setVariantTemplateModal } = useGlobalStore();
  const { setOpen, setOpenMobile } = useSidebar();
  const location = useLocation();
  const pathRef = React.useRef(location.pathname);

  React.useEffect(() => {
    if (location.pathname !== pathRef.current) {
      setOpenMobile(false);
      setVariantTemplateModal(false);
    }
    pathRef.current = location.pathname;
  }, [location.pathname, setOpen, setOpenMobile, setVariantTemplateModal]);

  React.useEffect(() => {
    const getData = async () => {
      const http = new Http();
      const res = await http.get("/");
      setBuild(res);
    };
    getData();
  }, []);

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <Header />
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === location.pathname}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reports.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === location.pathname}
                  >
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === location.pathname}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem key="Variant Templates">
                <SidebarMenuButton
                  asChild
                  // isActive={item.url === location.pathname}
                >
                  <Link to="" onClick={() => setVariantTemplateModal(true)}>
                    <BookType />
                    <span>Variant Templates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <UserIcon />
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem onClick={logout}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <footer className="text-center mt-auto py-2 border-t gap-2 flex flex-col">
          &copy; {new Date().getFullYear()} My Hardware
          <div className="text-xs uppercase">{build?.env}</div>
          <div className="text-xs">
            {formatDateTime(String(build?.buildTime ?? ""))}
          </div>
        </footer>
      </SidebarFooter>
    </Sidebar>
  );
}
