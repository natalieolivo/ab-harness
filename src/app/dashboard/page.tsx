"use client";

import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import styles from "@/styles/dashboard.module.css";
import type { ExperimentResult } from "@/app/api/results/route";

export default function Dashboard() {
    const [results, setResults] = useState<ExperimentResult[] | null>(null);

    useEffect(() => {
        fetch("/api/results")
            .then((res) => res.json())
            .then((data) => setResults(data.results));
    }, []);

    if (!results) return null;

    return (
        <div className={styles.dashboard}>
            <h1>Results</h1>
            {results.map((experiment) => (
                <ExperimentPanel key={experiment.experimentId} experiment={experiment} />
            ))}
            <Generator />
        </div>
    );
}

function Generator() {
    const [product, setProduct] = useState("");
    const [variants, setVariants] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setVariants(null);

        const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product, count: 4 }),
        });
        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.error ?? "Generation failed.");
            return;
        }
        setVariants(data.variants);
    }

    return (
        <section>
            <h2>Generator</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Describe the product"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Generating…" : "Generate headlines"}
                </button>
            </form>
            {error && <p className={styles.empty}>{error}</p>}
            {variants && (
                <ul>
                    {variants.map((v, i) => (
                        <li key={i}>{v}</li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function ExperimentPanel({ experiment }: { experiment: ExperimentResult }) {
    const hasData = experiment.variants.some((v) => v.exposures > 0);
    const chartData = experiment.variants.map((v) => ({
        variant: v.variantId,
        Exposures: v.exposures,
        Conversions: v.conversions,
    }));

    return (
        <section>
            <h2>{experiment.experimentId}</h2>
            {!hasData ? (
                <p className={styles.empty}>Not enough data yet.</p>
            ) : (
                <Tabs.Root defaultValue="chart">
                    <Tabs.List className={styles.tabsList}>
                        <Tabs.Trigger className={styles.tabsTrigger} value="chart">
                            Chart
                        </Tabs.Trigger>
                        <Tabs.Trigger className={styles.tabsTrigger} value="table">
                            Table
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="chart">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} barGap={2}>
                                <CartesianGrid vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="variant" stroke="var(--text-secondary)" fontSize={14} />
                                <YAxis allowDecimals={false} stroke="var(--text-secondary)" fontSize={14} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Exposures" fill="var(--chart-exposures)" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar dataKey="Conversions" fill="var(--chart-conversions)" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Tabs.Content>

                    <Tabs.Content value="table">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Variant</th>
                                    <th>Exposures</th>
                                    <th>Conversions</th>
                                    <th>Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {experiment.variants.map((v) => (
                                    <tr key={v.variantId}>
                                        <td>{v.variantId}</td>
                                        <td>{v.exposures}</td>
                                        <td>{v.conversions}</td>
                                        <td>{(v.rate * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Tabs.Content>
                </Tabs.Root>
            )}
        </section>
    );
}
