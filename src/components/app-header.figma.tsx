import figma from "@figma/code-connect"
import { AppHeader } from "./app-header"

// AppHeader — sticky top bar with sidebar trigger, breadcrumb, and notification bell
// Node ID will be assigned after Figma frame creation
figma.connect(AppHeader, "https://www.figma.com/design/AxOnJViNOMcviAAUmcudhA?node-id=TODO-HEADER", {
  props: {
    pageTitle: figma.string("PageTitle"),
  },
  example: ({ pageTitle }) => <AppHeader pageTitle={pageTitle} />,
})
