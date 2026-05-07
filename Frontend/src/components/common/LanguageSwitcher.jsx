import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language || 'en';

  const getLanguageLabel = (code) => {
    switch (code.split('-')[0]) {
      case 'hi': return 'हिन्दी';
      case 'mr': return 'मराठी';
      case 'en': 
      default: return 'English';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9 px-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{getLanguageLabel(currentLanguage)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')} className={currentLanguage.startsWith('en') ? 'bg-muted' : ''}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('hi')} className={currentLanguage.startsWith('hi') ? 'bg-muted' : ''}>
          हिन्दी
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('mr')} className={currentLanguage.startsWith('mr') ? 'bg-muted' : ''}>
          मराठी
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
