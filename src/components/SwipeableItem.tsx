import { motion, PanInfo, useAnimation } from "framer-motion";
import { Trash2, Edit2 } from "lucide-react";
import { ReactNode } from "react";

interface SwipeableItemProps {
    children: ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
    threshold?: number;
}

const SwipeableItem = ({
    children,
    onEdit,
    onDelete,
    className = "",
    threshold = 80
}: SwipeableItemProps) => {
    const controls = useAnimation();

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const offset = info.offset.x;

        if (offset < -threshold) {
            // Swiped Left (Revealing actions)
            // For now, let's just snap open to show buttons, or we could trigger action immediately if swipe is far enough.
            // A common pattern is: Swipe a bit -> Snap open. Swipe FAR -> Auto-trigger primary destructive action.
            // Let's stick to "Snap Open" for safety, max drag -150px
            if (offset < -50) {
                await controls.start({ x: -140 });
            } else {
                await controls.start({ x: 0 });
            }
        } else if (offset > 0) {
            // Swiped Right (prevent or maybe another action?)
            // Snap back
            await controls.start({ x: 0 });
        } else {
            // Did not swipe enough
            await controls.start({ x: 0 });
        }
    };

    const closeSwipe = () => {
        controls.start({ x: 0 });
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Background Actions Layer */}
            <div className="absolute inset-y-0 right-0 flex w-[140px]">
                {onEdit && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeSwipe();
                            onEdit();
                        }}
                        className="bg-gray-100 w-1/2 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeSwipe();
                            onDelete();
                        }}
                        className="bg-red-500 w-1/2 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Foreground Content Layer */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -140, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="relative bg-white z-10"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default SwipeableItem;
