import { Link, Outlet } from 'umi';
import styles from './index.less';

export default function Layout() {
  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
