// ─────────────────────────────────────────────────────────────────────────
// Pairwise Connection view — the same Connection Theory used in the group
// engine, but focused on exactly two people: their Companionship/Dominance/
// Electromagnetic/Compromise channels, a center-by-center read on who
// carries what between just the two of them, and concrete, two-way "how to
// support each other" guidance built from each person's own Type/Strategy/
// Authority.
// ─────────────────────────────────────────────────────────────────────────
import { CENTER_NAMES } from "./hdData";
import { pairwiseConnections, type CircleMember, type PairConnection } from "./circleEngine";
import { TYPE_SUPPORT_TIPS, AUTHORITY_SUPPORT_TIPS } from "./supportTips";

/** Companionship/Dominance/Electromagnetic/Compromise between exactly these two people. */
export function computePairConnections(a: CircleMember, b: CircleMember): PairConnection {
  return pairwiseConnections([a, b])[0];
}

export interface CenterDynamic {
  center: string;
  kind: "shared" | "aAnchors" | "bAnchors" | "sharedOpen";
  text: string;
}

/** Center-by-center read: who carries what between just these two. */
export function computeCenterDynamics(a: CircleMember, b: CircleMember): CenterDynamic[] {
  return CENTER_NAMES.map((center) => {
    const aDef = a.chart.definedCenters.includes(center);
    const bDef = b.chart.definedCenters.includes(center);
    let kind: CenterDynamic["kind"];
    let text: string;
    if (aDef && bDef) {
      kind = "shared";
      text = `Both of you run ${center} steadily — easy, dependable shared ground between you, not something either of you needs to explain to the other.`;
    } else if (aDef && !bDef) {
      kind = "aAnchors";
      text = `${a.name} runs ${center} steadily; ${b.name} will feel and amplify ${a.name}'s energy here. Genuinely useful in the moment — worth ${b.name} checking afterward what was actually theirs.`;
    } else if (bDef && !aDef) {
      kind = "bAnchors";
      text = `${b.name} runs ${center} steadily; ${a.name} will feel and amplify ${b.name}'s energy here. Genuinely useful in the moment — worth ${a.name} checking afterward what was actually theirs.`;
    } else {
      kind = "sharedOpen";
      text = `Neither of you runs ${center} on your own — together you'll pick up and amplify whatever's around you here, for better or worse. Worth naming as a shared blind spot rather than mistaking it for who either of you is.`;
    }
    return { center, kind, text };
  });
}

function fillName(template: string, name: string): string {
  return template.replaceAll("{name}", name);
}

export interface SupportText {
  type: string;
  authority: string;
}

/** How `other` can support `person`, from person's own Type + Authority. */
export function supportTextFor(person: CircleMember): SupportText {
  const typeTip = TYPE_SUPPORT_TIPS[person.chart.type];
  const authorityTip = AUTHORITY_SUPPORT_TIPS[person.chart.authority.key];
  return {
    type: typeTip ? fillName(typeTip, person.name) : "",
    authority: authorityTip ? fillName(authorityTip, person.name) : "",
  };
}

export interface Connection {
  connections: PairConnection;
  centerDynamics: CenterDynamic[];
  supportForA: SupportText;
  supportForB: SupportText;
}

/** Full two-way connection package for a pair of members. */
export function computeConnection(a: CircleMember, b: CircleMember): Connection {
  return {
    connections: computePairConnections(a, b),
    centerDynamics: computeCenterDynamics(a, b),
    supportForA: supportTextFor(a),
    supportForB: supportTextFor(b),
  };
}
