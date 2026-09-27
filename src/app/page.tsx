import styles from "@/styles/page.module.css";
import { headers } from "next/headers";
import { experiments } from "@/lib/experiments";
import ExperimentTracker from "@/app/experimentTracker";
import SubscribeBtn from "@/app/components/cta";

export default async function Home() {
  const listOfHeaders = await headers();
  const variantId = listOfHeaders.get('x-ab-landing-headline');
  const userId = listOfHeaders.get('x-ab-uid');

  const experiment = experiments['landing-headline']
  const experimentId = Object.keys(experiments)[0];
  const variant = experiment.variants.find(v => v.id === variantId)
  
  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <h1>
        {Object.entries(experiments).map(([key]) => (
          <div key={key}>
            {variant?.headline}
          </div>
        ))}
        </h1>
        <SubscribeBtn 
          eid={experimentId}
          vid={variantId}
          uuid={userId}/>

        <ExperimentTracker 
          eid={experimentId}
          vid={variantId}
          uuid={userId}
        />
      </div>      
    </div>
  );
}
