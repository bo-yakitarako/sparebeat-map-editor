export interface IMapOption {
	barLine?: string | boolean;
	bpm?: string | number;
	speed?: string | number;
};

export type mapUnion = string | IMapOption;
export default interface ISparebeatJson {
	title?: string;
	artist?: string;
	url?: string;
	bgColor?: string[];
	beats?: number;
	bpm: number | string;
	startTime: number;
	level: {
		easy: number | string;
		normal: number | string;
		hard: number | string;
	};
	map: {
		easy: mapUnion[];
		normal: mapUnion[];
		hard: mapUnion[];
	};
}