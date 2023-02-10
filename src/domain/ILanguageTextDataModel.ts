/**
 * 언어별 텍트스
 *
 */
export interface ILanguageTextDataModel {
    /**
     * 언어별 텍스트의 언어 구분값<br><br>
     *
     * @see Locale#getLanguage() 언어 키를 사용 함
     */
    lang: string;

    /**
     * 언어별 텍스트의 실제 텍스트
     */
    text: string;
}
