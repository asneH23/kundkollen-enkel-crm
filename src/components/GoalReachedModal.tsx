import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface GoalReachedModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    amount: number;
}

const GoalReachedModal = ({ open, onOpenChange, amount }: GoalReachedModalProps) => {
    useEffect(() => {
        if (open) {
            // Intense celebration confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                // launch a few confetti from the left edge
                confetti({
                    particleCount: 7,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#16A34A', '#FFD700', '#ffffff'] // Green, Gold, White
                });
                // and launch a few from the right edge
                confetti({
                    particleCount: 7,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#16A34A', '#FFD700', '#ffffff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-0 bg-gradient-to-b from-green-50 to-white text-center p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="bg-[#16A34A] p-8 flex justify-center items-center relative overflow-hidden">
                    {/* Background decoration circles */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

                    <div className="relative z-10 bg-white p-4 rounded-full shadow-xl animate-bounce-slow">
                        <Trophy className="h-12 w-12 text-[#16A34A]" />
                    </div>

                    {/* Floating stars */}
                    <Star className="absolute top-6 right-8 text-yellow-300 h-6 w-6 animate-pulse" fill="currentColor" />
                    <Star className="absolute bottom-6 left-8 text-yellow-300 h-4 w-4 animate-pulse delay-75" fill="currentColor" />
                </div>

                <div className="p-8 pt-6 space-y-4">
                    <DialogTitle className="text-3xl font-bold text-[#16A34A]">
                        Grattis! 🎉
                    </DialogTitle>
                    <DialogDescription className="text-lg text-gray-600">
                        Du har nått ditt månadsmål!
                    </DialogDescription>

                    <div className="py-2">
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Total försäljning</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tight mt-1">
                            {amount.toLocaleString()} kr
                        </p>
                    </div>

                    <DialogFooter className="pt-4 justify-center sm:justify-center">
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="bg-[#16A34A] hover:bg-[#15803d] text-white rounded-xl px-8 py-6 text-lg w-full shadow-lg shadow-green-200 transition-all hover:scale-105"
                        >
                            Grymt jobbat! 💪
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GoalReachedModal;
