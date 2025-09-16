// frontend/src/pages/ExamplePage.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ExamplePage() {
  const [data, setData] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = { data };

    try {
      const response = await fetch("http://localhost:8000/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      alert("Sent");
      setData("");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to push");
    }
  };

  return (
    <div className="App flex min-h-svh flex-col items-center justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Push data</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit} autoComplete="off">
            <DialogHeader>
              <DialogTitle>Push to DB</DialogTitle>
              <DialogDescription>
                Push a string to the database [test]
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 py-4">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="data-input" className="sr-only">
                  Data
                </Label>
                <Input
                  id="data-input"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  placeholder="What's on your mind?"
                  required
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button type="submit" variant="secondary">
                  Submit
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
