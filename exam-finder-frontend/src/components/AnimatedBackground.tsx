import { motion } from "framer-motion";

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background transition-colors duration-500">
            {/* Soft gradient wash */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/5 via-accent/5 to-transparent" />

            {/* Floating Orb 1 */}
            <motion.div
                animate={{
                    x: [0, 150, -100, 0],
                    y: [0, -150, 100, 0],
                    scale: [1, 1.2, 0.8, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[10%] left-[20%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-60"
            />

            {/* Floating Orb 2 */}
            <motion.div
                animate={{
                    x: [0, -150, 100, 0],
                    y: [0, 150, -100, 0],
                    scale: [1, 0.8, 1.3, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[30%] right-[10%] w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-accent/20 rounded-full blur-[100px] md:blur-[150px] mix-blend-multiply dark:mix-blend-screen opacity-50"
            />

            {/* Floating Orb 3 */}
            <motion.div
                animate={{
                    x: [0, 100, -150, 0],
                    y: [0, 100, -150, 0],
                    scale: [1, 1.4, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute bottom-[-10%] left-[40%] w-[400px] h-[400px] md:w-[700px] md:h-[700px] bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-[100px] md:blur-[150px] mix-blend-multiply dark:mix-blend-screen opacity-50"
            />

            {/* Grid overlay for texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 dark:opacity-5" />
        </div>
    );
};
