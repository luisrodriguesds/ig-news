import { GetStaticProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "./index.module.scss"

interface IHomePage {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: IHomePage) {
  return (
    <>
      <Head>
        <title> Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br/>
            <span>for {product.amount}/ month </span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="girl"/>
      </main>
    </>
  )
}

// getServerSideProps -> proccess on server

export const getStaticProps: GetStaticProps = async () => {
  const resStripe = await stripe.get('/prices/price_1Ib3raFcXHk7kNTMGsbSN6i7')
  
  const { data: price } = resStripe;
  return {
    props: {
      product: {
        priceId: price.id,
        amount: new Intl.NumberFormat("en-US", {
          style: 'currency',
          currency: 'USD'
        }).format(price.unit_amount / 100)
      }
    },
    revalidate: 60 * 60 * 24 // 24h
  }
}
