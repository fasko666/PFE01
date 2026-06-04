import MilestoneList from '../milestones/MilestoneList';

/**
 * The Milestones tab inside ContractDetails is now a thin wrapper around the
 * standalone MilestoneList component, so both the contract page and any
 * standalone milestone view share the same UX + behavior.
 */
export default function MilestonesTab({ contract, onChanged }) {
  return <MilestoneList contract={contract} onChanged={onChanged} />;
}
