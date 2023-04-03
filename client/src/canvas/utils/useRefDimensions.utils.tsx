import { useEffect, useState } from "react";

export const useRefDimensions = (ref: React.RefObject<HTMLElement>) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    useEffect(() => {
        console.log("1 useeffect");
        if (!ref.current) { return; }
        console.log("1 useeffect ref.current");
        const resizeObserver = new ResizeObserver(() => {
            if (ref.current) {
                const { current } = ref;
                const boundingRect = current.getBoundingClientRect();
                const { width, height } = boundingRect;
                console.log("1 useeffect setDimensions");
                setDimensions({ width: Math.round(width), height: Math.round(height) });
            }
        });
        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        console.log("2 useeffect");

        if (ref.current) {
            const { current } = ref;
            const boundingRect = current.getBoundingClientRect();
            const { width, height } = boundingRect;
            console.log("2 useeffect setDimensions");
            setDimensions({ width: Math.round(width), height: Math.round(height) });
        }
    }, [ref]);
    return dimensions;
};
