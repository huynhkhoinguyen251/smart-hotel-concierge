import PageTitle from '../components/ui/PageTitle.jsx';
import { PHOTO_CREDITS } from '../config/photoCredits.js';

const LINK_CLASS = 'text-sea underline underline-offset-2 hover:text-sea-hover';

// /credits (công khai): nguồn, tác giả và giấy phép của các ảnh mẫu.
export default function CreditsPage() {
  return (
    <div className="shell py-10 lg:py-14">
      <PageTitle
        title="Photo credits"
        subtitle="Sample photos from Wikimedia Commons, cropped and resized. They illustrate this student project and do not show a real hotel."
      />
      <ul className="max-w-4xl divide-y divide-line-soft border-y border-line-soft">
        {PHOTO_CREDITS.map((photo) => (
          <li
            key={photo.source}
            className="grid gap-x-8 gap-y-1 py-4 text-sm sm:grid-cols-[12rem_minmax(0,1fr)]"
          >
            <p className="font-semibold text-ink">{photo.subject}</p>
            <div className="min-w-0">
              <p className="break-words">
                <a href={photo.source} target="_blank" rel="noreferrer" className={LINK_CLASS}>
                  {photo.title}
                </a>
              </p>
              <p className="mt-1 break-words text-ink-soft">
                {photo.author},{' '}
                <a href={photo.licenseUrl} target="_blank" rel="noreferrer" className={LINK_CLASS}>
                  {photo.license}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
