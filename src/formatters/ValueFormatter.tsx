import React, { useMemo } from 'react';
import type { FormatterProps } from '../types';

export function ValueFormatter<R>(props: FormatterProps<R>) {
    const cellValue = props.cell;
    const valueComponent = useMemo(() => {
        try {
            if (typeof cellValue === 'object') {
                return <>{cellValue.value}</>;
            }
            return <>{cellValue}</>;
        } catch {
            return null;
        }
    }, [cellValue]);

    return valueComponent;
}
