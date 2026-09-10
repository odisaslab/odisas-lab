import { trustBarItems } from "@/data/site";

export function TrustBar() {
  const items = [...trustBarItems, ...trustBarItems];

  return (
    <div
      className="border-y border-line bg-light py-5"
      aria-label="Áreas de trabajo de Odisas Lab"
    >
      <div className="mask-fade-x overflow-hidden">
        <div className="marquee-track">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-8 whitespace-nowrap px-8 text-sm font-medium text-gray"
              aria-hidden={index >= trustBarItems.length ? "true" : undefined}
            >
              {item}
              <span aria-hidden="true" className="size-1 rounded-full bg-primary" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
