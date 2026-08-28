export type ScryfallColor = "W" | "U" | "B" | "R" | "G";

export type ScryfallLegality = 
    | "legal"
    | "not_legal"
    | "restricted"
    | "banned";
export type ScryfallImageUris = {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
};
export type ScryfallCardFace = {
    name: string;
    mana_cost?: string | null;
    oracle_text?: string | null;
    type_line?: string | null;
    image_uris?: ScryfallImageUris | null;
};

export type ScryfallCard = {
  id: string;
  oracle_id?: string | null;
  name: string;

  set: string;
  set_name: string;
  collector_number: string;
  released_at: string;

  mana_cost?: string | null;
  cmc: number;
  type_line: string;
  oracle_text?: string | null;

  power?: string | null;
  toughness?: string | null;
  keywords: string[];

  color_identity: ScryfallColor[];
  legalities: Record<string, ScryfallLegality>;

  image_uris?: ScryfallImageUris | null;
  card_faces?: ScryfallCardFace[] | null;

  prices: {
    usd?: string | null;
    usd_foil?: string | null;
    usd_etched?: string | null;
    eur?: string | null;
    eur_foil?: string | null;
    tix?: string | null;
  };

  artist?: string | null;
  scryfall_uri: string;
};

export type ScryfallList<T> = {
  object: "list";
  data: T[];
  has_more: boolean;
  next_page?: string;
  total_cards?: number;
  warnings?: string[];
};

export type ScryfallError = {
  object: "error";
  status: number;
  code: string;
  details: string;
};