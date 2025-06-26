import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Home,
  HomeIcon,
  Target,
} from "lucide-react";
import { ROUTES } from "@/utils/definitions";
import { Link } from "react-router";
import Header from "./Header";

const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
  {
    title: "Purchases",
    url: ROUTES.PURCHASE_ORDERS,
    icon: BanknoteArrowUp,
  },
  {
    title: "Sales",
    url: ROUTES.SALES_ORDERS,
    icon: BanknoteArrowDown,
  },
  {
    title: "Inventory",
    url: ROUTES.INVENTORY,
    icon: Target,
  },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <Header />
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === location.pathname}
                  >
                    <Link to={item.url} className="hover:text-gray-400 ">
                      <div className="text-md w-full flex ">
                        <item.icon />
                        <span className="ml-2">{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
