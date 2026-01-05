import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h1>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Rất tiếc, ứng dụng gặp sự cố. Thông tin lỗi:
                    </p>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm text-left w-full max-w-lg overflow-auto mb-6 border border-border">
                        {this.state.error?.message || "Unknown error"}
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Tải lại trang
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                        >
                            Xóa cache & Thử lại
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
