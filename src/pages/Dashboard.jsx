import { useEffect, useMemo, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import SidebarLayout from "../layouts/sidebar-layout/SidebarLayout";
import PageTitle from "../components/ui/molecules/PageTitle";
import { useToast } from "../components/ui/toast/ToastProvider";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { listArticles } from "../api/articles";
import { listProducts } from "../api/products";
import { listVisitors } from "../api/visitors";
import KpiRow from "./dashboard/KpiRow";
import VisitorsChart from "./dashboard/VisitorsChart";
import TopArticles from "./dashboard/TopArticles";
import ProductStats from "./dashboard/ProductStats";
import ActivityFeed from "./dashboard/ActivityFeed";
import DashboardHeader from "./dashboard/DashboardHeader";
import SpotlightArticle from "./dashboard/SpotlightArticle";
import VisitorsGauge from "./dashboard/VisitorsGauge";
import QuickActionsPanel from "./dashboard/QuickActionsPanel";
import QuickNavTiles from "./dashboard/QuickNavTiles";
import RecentItemsRow from "./dashboard/RecentItemsRow";
import { bucketVisitors, computePeriodChange, detectSpikes, recentlyUpdated } from "./dashboard/dashboardUtils";

const VISITOR_SAMPLE_LIMIT = 1000;
const RECENT_ARTICLES_LIMIT = 50; // server-capped max per request

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const Dashboard = () => {
  const toast = useToast();
  const reduced = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  const [articles, setArticles] = useState([]);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [topArticles, setTopArticles] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [visitors, setVisitors] = useState([]);
  const [visitorsTotal, setVisitorsTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);

      const [articlesRes, topArticlesRes, productsRes, visitorsRes] = await Promise.all([
        listArticles({ limit: RECENT_ARTICLES_LIMIT, sort: "newest" }),
        listArticles({ limit: 5, sort: "popular" }),
        listProducts({}),
        listVisitors({ limit: VISITOR_SAMPLE_LIMIT, page: 1 }),
      ]);

      if (cancelled) return;

      if (articlesRes.success) {
        setArticles(articlesRes.data.articles || []);
        setArticlesTotal(articlesRes.data.total || 0);
      } else {
        toast.error(articlesRes.message, "Failed to load articles");
      }

      if (topArticlesRes.success) {
        setTopArticles(topArticlesRes.data.articles || []);
      } else {
        toast.error(topArticlesRes.message, "Failed to load top articles");
      }

      if (productsRes.success) {
        setProducts(productsRes.data.products || []);
        setProductsTotal(productsRes.data.total || 0);
      } else {
        toast.error(productsRes.message, "Failed to load products");
      }

      if (visitorsRes.success) {
        setVisitors(visitorsRes.data.visitors || []);
        setVisitorsTotal(visitorsRes.data.total || 0);
      } else {
        toast.error(visitorsRes.message, "Failed to load visitors");
      }

      setLoading(false);
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buckets = useMemo(() => bucketVisitors(visitors, range), [visitors, range]);
  const periodChange = useMemo(() => computePeriodChange(visitors, range), [visitors, range]);

  const spikeBuckets = useMemo(
    () => detectSpikes(bucketVisitors(visitors, "24h")).slice(-3),
    [visitors]
  );

  const avgViews = useMemo(() => {
    if (articles.length === 0) return 0;
    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    return Math.round(totalViews / articles.length);
  }, [articles]);

  const recentPublishedArticles = useMemo(
    () => recentlyUpdated(articles.filter((a) => a.status === "published"), "createdAt", 5),
    [articles]
  );
  const recentAnyArticles = useMemo(() => recentlyUpdated(articles, "createdAt", 5), [articles]);
  const recentProducts = useMemo(() => recentlyUpdated(products, "updatedAt", 5), [products]);
  const spotlightArticle = recentPublishedArticles[0] || articles[0] || null;

  return (
    <SidebarLayout>
      <PageTitle title="Dashboard" path={[{ name: "Dashboard", href: "/" }]} />

      <MotionConfig reducedMotion="user">
        <motion.div
          variants={containerVariants}
          initial={reduced ? false : "hidden"}
          animate="visible"
          className="dash-shell space-y-6 p-5 sm:p-7"
        >
          <motion.div variants={containerVariants}>
            <DashboardHeader />
          </motion.div>

          <motion.div variants={containerVariants}>
            <KpiRow
              visitorsCount={periodChange.current}
              visitorsDelta={visitorsTotal > 0 ? periodChange.percentChange : undefined}
              productsCount={productsTotal}
              articlesCount={articlesTotal}
              avgViews={avgViews}
              loading={loading}
            />
          </motion.div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <SpotlightArticle article={spotlightArticle} loading={loading} />
            </div>
            <VisitorsGauge
              current={periodChange.current}
              percentChange={visitorsTotal > 0 ? periodChange.percentChange : undefined}
              range={range}
              onRangeChange={setRange}
              loading={loading}
              reduced={reduced}
            />
            <QuickActionsPanel />
          </motion.div>

          <motion.div variants={containerVariants}>
            <QuickNavTiles
              productsCount={productsTotal}
              articlesCount={articlesTotal}
              visitorsCount={periodChange.current}
              loading={loading}
            />
          </motion.div>

          <motion.div variants={containerVariants}>
            <h2 className="mb-3 px-1 text-sm font-semibold text-white">Recently added</h2>
            <RecentItemsRow products={recentProducts} articles={recentAnyArticles} loading={loading} />
          </motion.div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VisitorsChart buckets={buckets} range={range} onRangeChange={setRange} loading={loading} reduced={reduced} />
            </div>
            <ActivityFeed
              articles={recentPublishedArticles}
              products={recentProducts}
              spikeBuckets={spikeBuckets}
              loading={loading}
            />
          </motion.div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopArticles articles={topArticles} loading={loading} reduced={reduced} />
            <ProductStats products={products} total={productsTotal} loading={loading} />
          </motion.div>
        </motion.div>
      </MotionConfig>
    </SidebarLayout>
  );
};

export default Dashboard;
