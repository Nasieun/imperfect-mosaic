import styles from './MosaicCanvas.module.css';

/**
 * 캔버스가 준비되기 전 같은 자리·같은 바탕을 먼저 그려 둔다(첫 화면이 비지 않도록).
 * label이 있으면 가운데에 조용한 안내 한 줄을 둔다.
 */
export default function CanvasPlaceholder({ label }: { label?: string }) {
  return (
    <div className={styles.wrap} aria-hidden={label ? undefined : true}>
      {label && <p className={styles.placeholderText}>{label}</p>}
    </div>
  );
}
