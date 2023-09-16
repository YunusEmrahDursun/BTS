
export interface IGamer {
    id: number;
    name: string;
    top?:number;
    left?:number;
}


function getNew(
    name: string,
): IGamer {
    return {
        id: -1,
        name,
        top:400,
        left:400
    };
}


// Export default
export default {
    new: getNew,
}
