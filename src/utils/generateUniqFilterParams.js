export default function generateUniqParams(data) {
  const uniqLocation = [
    ...new Set(data.map((item) => item?.place?.city).filter(Boolean)),
  ];
  const uniqTypes = [
    ...new Set(data.flatMap((item) => item?.types ?? []).filter(Boolean)),
  ];
  const uniqThemes = [
    ...new Set(data.flatMap((item) => item?.themes ?? []).filter(Boolean)),
  ];

  const propData = {
    location: uniqLocation,
    types: uniqTypes,
    theme: uniqThemes,
  };

  return propData;
}
