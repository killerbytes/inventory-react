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
} from "lucide-react";
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
import Header from "./Header";
import UserIcon from "./User";
import React from "react";
import axios from "axios";

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
];

const reports = [
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
  const [build, setBuild] = React.useState("");
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
      const res = await axios.get("/data.json");
      setBuild(res.data.build);
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
        <footer className="text-center mt-auto border-t  py-2">
          &copy; {new Date().getFullYear()} My Hardware.{" "}
          <div className="text-xs">{formatDateTime(build)}</div>
        </footer>
      </SidebarFooter>
    </Sidebar>
  );
}
