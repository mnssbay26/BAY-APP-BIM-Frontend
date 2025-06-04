import React, { useRef, useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';

const BarChart_NivoRoleUsers = ({ roleCounts, onRoleClick }) => {
    const chartContainerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(400);

    // Actualizar el ancho del contenedor
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width);
            }
        });

        if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
        }

        return () => {
            if (chartContainerRef.current) {
                resizeObserver.unobserve(chartContainerRef.current);
            }
        };
    }, []);

    const data = Object.keys(roleCounts).map((role) => ({
        role,
        count: roleCounts[role],
    }));

    const maxRoles = Math.max(...Object.values(roleCounts), 0);

    const tickStep = maxRoles <= 20 ? 1 : 10;
    const tickValues = Array.from(
        { length: Math.ceil(maxRoles / tickStep) + 1 },
        (_, i) => i * tickStep
    );



    return (
        <div ref={chartContainerRef} style={{ height: '85%', width: '100%' }}>
            <ResponsiveBar
                data={data}
                keys={['count']}
                indexBy="role"
                margin={{ top: 3, right: 3, bottom: 25, left: 150 }}
                padding={0.3}
                layout="horizontal"
                colors={['#00BCFF']}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 4,
                    tickPadding: 5,
                    tickRotation: 0,
                    tickValues: tickValues,
                    legend: '',
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                }}
                enableGridX={true}
                enableGridY={false}
                width={containerWidth} // Ajustar el ancho dinámicamente
                height={350}
                tooltip={({ id, value }) => (
                    <div
                        style={{
                            padding: '5px 10px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            borderRadius: '1px',
                        }}
                    >
                        <strong>{id}</strong>: {value}
                    </div>
                )}
                onClick={(node) => {
                    if (onRoleClick) {
                        onRoleClick(node.indexValue); // Usar `id` como el identificador del rol
                    }
                }}
            />
        </div>
    );
};

export default BarChart_NivoRoleUsers;