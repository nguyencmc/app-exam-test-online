import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';

interface ModuleFormData {
    title: string;
    description: string;
}

interface ModuleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    formData: ModuleFormData;
    onFormChange: (data: ModuleFormData) => void;
    onSave: () => void;
    saving: boolean;
}

export const ModuleFormDialog = ({
    open,
    onOpenChange,
    isEditing,
    formData,
    onFormChange,
    onSave,
    saving,
}: ModuleFormDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Chỉnh sửa module' : 'Thêm module mới'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="module-title">Tên module *</Label>
                        <Input
                            id="module-title"
                            value={formData.title}
                            onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
                            placeholder="VD: Chương 1: Giới thiệu"
                        />
                    </div>
                    <div>
                        <Label htmlFor="module-desc">Mô tả</Label>
                        <Textarea
                            id="module-desc"
                            value={formData.description}
                            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                            placeholder="Mô tả nội dung chương..."
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={onSave} disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isEditing ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export type { ModuleFormData };
