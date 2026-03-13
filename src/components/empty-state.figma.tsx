import figma from "@figma/code-connect"
import { EmptyState } from "./empty-state"
import { Users } from "lucide-react"
import { Button } from "./ui/button"

// EmptyState — centered placeholder with icon, title, description, and optional CTA
// Node ID will be assigned after Figma frame creation
figma.connect(EmptyState, "https://www.figma.com/design/AxOnJViNOMcviAAUmcudhA?node-id=TODO-EMPTYSTATE", {
  props: {
    title: figma.string("Title"),
    description: figma.string("Description"),
  },
  example: ({ title, description }) => (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title={title}
      description={description}
      action={<Button>Athlet hinzufuegen</Button>}
    />
  ),
})
