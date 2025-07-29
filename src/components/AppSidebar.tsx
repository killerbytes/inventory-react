import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { BanknoteArrowDown, BanknoteArrowUp, Home, Target } from "lucide-react";
import { formatDateTime } from "@/utils/formatters";
import { ROUTES } from "@/utils/definitions";
import { Link } from "react-router";
import Header from "./Header";
import React from "react";
import axios from "axios";

const items = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
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
  const [build, setBuild] = React.useState("");

  React.useEffect(() => {
    const getData = async () => {
      const res = await axios.get("/data.json");
      setBuild(res.data.build);
    };
    getData();
  }, []);

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
        <footer className="bg-foreground text-background py-4 text-center mt-auto">
          &copy; {new Date().getFullYear()} My Hardware.{" "}
          <div className="text-xs">{formatDateTime(build)}</div>
        </footer>
      </SidebarContent>
    </Sidebar>
  );
}
