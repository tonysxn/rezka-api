export const product = (iterables, repeat) => {
    const copies = [];
    for (let i = 0; i < repeat; i++) {
        copies.push(iterables.slice()); // Clone
    }

    return copies.reduce(function tl(accumulator, value) {
        const tmp = [];
        accumulator.forEach(function (a0) {
            value.forEach(function (a1) {
                tmp.push(a0.concat(a1));
            });
        });
        return tmp;
    }, [[]]);
}