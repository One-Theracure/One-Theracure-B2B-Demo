import { Plus, Upload, Camera, Monitor, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AttachmentMenuProps {
  onUploadFile: () => void;
  onUploadPhoto: () => void;
  onTakePhoto: () => void;
  onTakeScreenshot: () => void;
}

export const AttachmentMenu = ({
  onUploadFile,
  onUploadPhoto,
  onTakePhoto,
  onTakeScreenshot,
}: AttachmentMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Attach document"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onUploadFile} className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUploadPhoto} className="cursor-pointer">
          <ImagePlus className="mr-2 h-4 w-4" />
          Upload Photo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTakePhoto} className="cursor-pointer">
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTakeScreenshot} className="cursor-pointer">
          <Monitor className="mr-2 h-4 w-4" />
          Take Screenshot
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};