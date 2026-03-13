import figma from "@figma/code-connect"
import { AppSidebar } from "./app-sidebar"

// AppSidebar — Expanded state (256px wide, dark background)
// Node ID will be assigned after Figma frame creation
figma.connect(AppSidebar, "https://www.figma.com/design/AxOnJViNOMcviAAUmcudhA?node-id=TODO-EXPANDED", {
  example: () => <AppSidebar />,
})

// AppSidebar — Collapsed/Icon state (56px wide)
figma.connect(AppSidebar, "https://www.figma.com/design/AxOnJViNOMcviAAUmcudhA?node-id=TODO-COLLAPSED", {
  example: () => <AppSidebar />,
})
