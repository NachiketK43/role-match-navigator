import { Card } from "@/components/ui/card"
import { Send } from "lucide-react"

const AIOutreachTemplates = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center space-y-4">
          <Send className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">AI Outreach Templates</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </Card>
      </div>
    </div>
  )
}

export default AIOutreachTemplates
